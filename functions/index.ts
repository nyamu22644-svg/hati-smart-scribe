
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as cors from 'cors';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import type { 
  RegistrationResponseJSON, 
  AuthenticationResponseJSON 
} from '@simplewebauthn/types';

const rpID = 'hati-certified.web.app';
const rpName = 'HATI Official Registry';
const origin = `https://${rpID}`;

admin.initializeApp();
const db = admin.firestore();
const corsHandler = cors({ origin: true });

// ... existing WebAuthn functions (generateRegOptions, verifyRegResponse, etc) ...

export const generateRegOptions = functions.https.onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new functions.https.HttpsError('unauthenticated', 'Authority signature required.');
  const userDoc = await db.collection('users').doc(uid).get();
  const userData = userDoc.data();
  if (!userData) throw new functions.https.HttpsError('not-found', 'Identity not found.');
  const options = await generateRegistrationOptions({
    rpName, rpID, userID: Buffer.from(uid), userName: userData.email, userDisplayName: userData.name,
    attestationType: 'none', authenticatorSelection: { residentKey: 'required', userVerification: 'preferred' },
  });
  await db.collection('users').doc(uid).collection('challenges').doc('registration').set({
    challenge: options.challenge, createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return options;
});

export const verifyRegResponse = functions.https.onCall(async (request) => {
  const uid = request.auth?.uid;
  const { body } = request.data as { body: RegistrationResponseJSON };
  if (!uid) throw new functions.https.HttpsError('unauthenticated', 'Authority required.');
  const challengeDoc = await db.collection('users').doc(uid).collection('challenges').doc('registration').get();
  const expectedChallenge = challengeDoc.data()?.challenge;
  if (!expectedChallenge) throw new functions.https.HttpsError('failed-precondition', 'Expired challenge.');
  try {
    const verification = await verifyRegistrationResponse({ response: body, expectedChallenge, expectedOrigin: origin, expectedRPID: rpID });
    if (verification.verified && verification.registrationInfo) {
      const { credentialPublicKey, credentialID, counter } = verification.registrationInfo;
      const newPasskey = {
        credentialID: Buffer.from(credentialID).toString('base64'),
        publicKey: Buffer.from(credentialPublicKey).toString('base64'),
        counter, transports: body.response.transports || [], createdAt: Date.now(),
      };
      await db.collection('users').doc(uid).update({ passkeys: admin.firestore.FieldValue.arrayUnion(newPasskey) });
      await challengeDoc.ref.delete();
      return { verified: true };
    }
    return { verified: false };
  } catch (error: any) { throw new functions.https.HttpsError('internal', error.message); }
});

export const generateAuthOptions = functions.https.onCall(async (request) => {
  const { email } = request.data as { email: string };
  const userSnapshot = await db.collection('users').where('email', '==', email).limit(1).get();
  if (userSnapshot.empty) throw new functions.https.HttpsError('not-found', 'Identity not found.');
  const userDoc = userSnapshot.docs[0];
  const passkeys = userDoc.data()?.passkeys || [];
  if (passkeys.length === 0) throw new functions.https.HttpsError('failed-precondition', 'No Passkeys found.');
  const options = await generateAuthenticationOptions({
    rpID, allowCredentials: passkeys.map((p: any) => ({ id: p.credentialID, type: 'public-key', transports: p.transports })),
    userVerification: 'preferred',
  });
  await db.collection('users').doc(userDoc.id).collection('challenges').doc('authentication').set({
    challenge: options.challenge, createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return options;
});

// HTTP endpoint for generateAuthOptions (for CORS support)
export const generateAuthOptionsHTTP = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method === 'POST') {
      try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email required' });
        
        const userSnapshot = await db.collection('users').where('email', '==', email).limit(1).get();
        if (userSnapshot.empty) return res.status(404).json({ error: 'Identity not found' });
        
        const userDoc = userSnapshot.docs[0];
        const passkeys = userDoc.data()?.passkeys || [];
        if (passkeys.length === 0) return res.status(412).json({ error: 'No Passkeys found' });
        
        const options = await generateAuthenticationOptions({
          rpID, allowCredentials: passkeys.map((p: any) => ({ id: p.credentialID, type: 'public-key', transports: p.transports })),
          userVerification: 'preferred',
        });
        
        await db.collection('users').doc(userDoc.id).collection('challenges').doc('authentication').set({
          challenge: options.challenge, createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        
        res.json(options);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  });
});

export const verifyAuthResponse = functions.https.onCall(async (request) => {
  const { body, email } = request.data as { body: AuthenticationResponseJSON, email: string };
  const userSnapshot = await db.collection('users').where('email', '==', email).limit(1).get();
  if (userSnapshot.empty) throw new functions.https.HttpsError('not-found', 'Identity not found.');
  const userDoc = userSnapshot.docs[0];
  const userData = userDoc.data() || {};
  const passkey = (userData.passkeys || []).find((p: any) => p.credentialID === body.id);
  if (!passkey) throw new functions.https.HttpsError('not-found', 'Passkey not recognized.');
  const challengeDoc = await db.collection('users').doc(userDoc.id).collection('challenges').doc('authentication').get();
  const expectedChallenge = challengeDoc.data()?.challenge;
  if (!expectedChallenge) throw new functions.https.HttpsError('failed-precondition', 'Challenge expired.');
  try {
    const verification = await verifyAuthenticationResponse({
      response: body, expectedChallenge, expectedOrigin: origin, expectedRPID: rpID,
      authenticator: { credentialID: Buffer.from(passkey.credentialID, 'base64'), credentialPublicKey: Buffer.from(passkey.publicKey, 'base64'), counter: passkey.counter },
    });
    if (verification.verified) {
      const customToken = await admin.auth().createCustomToken(userDoc.id);
      return { verified: true, customToken };
    }
    return { verified: false };
  } catch (error: any) { throw new functions.https.HttpsError('internal', error.message); }
});

/**
 * HATI GUARDIAN PROTOCOL - VITAL SIGNS MONITOR
 * Runs every 24 hours to check for inactive Guardians.
 */
export const monitorVitalSigns = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
  console.log('HATI_SECURITY: Starting daily Vital Signs monitor...');
  
  const usersSnapshot = await db.collection('users')
    .where('guardian_settings.status', '==', 'active')
    .get();

  const now = Date.now();
  const batch = db.batch();

  for (const doc of usersSnapshot.docs) {
    const userData = doc.data();
    const lastActive = userData.lastActiveAt?.toMillis() || 0;
    const thresholdDays = userData.guardian_settings?.inactivityThresholdDays || 90;
    const thresholdMs = thresholdDays * 24 * 60 * 60 * 1000;

    if (now - lastActive > thresholdMs) {
      console.warn(`HATI_SECURITY: Triggering Emergency Access for User ${doc.id}`);
      
      batch.update(doc.ref, {
        'guardian_settings.status': 'escrow',
        'guardian_settings.unlockDate': now
      });

      // MOCK: Send Emergency Alert Email to Guardian
      console.log(`[EMAIL_MOCK] To: ${userData.guardian_settings.guardianEmail}`);
      console.log(`Subject: EMERGENCY ALERT: Access ${userData.name}'s Medical Vault.`);
      console.log(`Body: You are the designated Guardian for ${userData.name}. Their Hati account has been inactive for ${thresholdDays} days, indicating a potential emergency. Use this secure link to authenticate: https://${rpID}/#/emergency/${doc.id}`);
    }
  }

  await batch.commit();
  return null;
});

/**
 * INVITE GUARDIAN
 * Callable function to invite guardians to the platform.
 */
export const inviteGuardian = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authority required.');
  }

  const { guardianEmail, guardianName } = data;
  const ownerName = context.auth.token.name || 'A Hati User';

  // MOCK: Send Invitation Email
  console.log(`[EMAIL_MOCK] To: ${guardianEmail}`);
  console.log(`Subject: Important: ${ownerName} has appointed you as their Medical Guardian on Hati.`);
  console.log(`Body: Hello ${guardianName}, you have been trusted as a Medical Guardian for ${ownerName}. Please create a free Hati account to verify your identity and accept this responsibility.`);

  return { success: true };
});
