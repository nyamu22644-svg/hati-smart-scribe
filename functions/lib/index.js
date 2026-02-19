"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractMedicalData = exports.sendEmergencyAlert = exports.sendCampaignNotification = exports.sendPaymentConfirmation = exports.sendGuardianInvite = exports.inviteGuardian = exports.monitorVitalSigns = exports.elevateUserToAdmin = exports.createBiometricAuthToken = exports.verifyAuthResponse = exports.generateAuthOptionsHTTP = exports.generateAuthOptions = exports.verifyRegResponse = exports.generateRegOptions = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const cors_1 = __importDefault(require("cors"));
const server_1 = require("@simplewebauthn/server");
const rpID = 'hati-certified.web.app';
const rpName = 'HATI Official Registry';
const origin = `https://${rpID}`;
admin.initializeApp();
const db = admin.firestore();
const corsHandler = (0, cors_1.default)({ origin: true });
// ... existing WebAuthn functions (generateRegOptions, verifyRegResponse, etc) ...
exports.generateRegOptions = functions.https.onCall(async (request) => {
    const uid = request.auth?.uid;
    if (!uid)
        throw new functions.https.HttpsError('unauthenticated', 'Authority signature required.');
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data();
    if (!userData)
        throw new functions.https.HttpsError('not-found', 'Identity not found.');
    const options = await (0, server_1.generateRegistrationOptions)({
        rpName, rpID, userID: uid, userName: userData.email, userDisplayName: userData.name,
        attestationType: 'none', authenticatorSelection: { residentKey: 'required', userVerification: 'preferred' },
    });
    await db.collection('users').doc(uid).collection('challenges').doc('registration').set({
        challenge: options.challenge, createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return options;
});
exports.verifyRegResponse = functions.https.onCall(async (request) => {
    const uid = request.auth?.uid;
    const { body } = request.data;
    if (!uid)
        throw new functions.https.HttpsError('unauthenticated', 'Authority required.');
    const challengeDoc = await db.collection('users').doc(uid).collection('challenges').doc('registration').get();
    const expectedChallenge = challengeDoc.data()?.challenge;
    if (!expectedChallenge)
        throw new functions.https.HttpsError('failed-precondition', 'Expired challenge.');
    try {
        const verification = await (0, server_1.verifyRegistrationResponse)({ response: body, expectedChallenge, expectedOrigin: origin, expectedRPID: rpID });
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
    }
    catch (error) {
        throw new functions.https.HttpsError('internal', error.message);
    }
});
exports.generateAuthOptions = functions.https.onCall(async (request) => {
    const { email } = request.data;
    const userSnapshot = await db.collection('users').where('email', '==', email).limit(1).get();
    if (userSnapshot.empty)
        throw new functions.https.HttpsError('not-found', 'Identity not found.');
    const userDoc = userSnapshot.docs[0];
    const passkeys = userDoc.data()?.passkeys || [];
    if (passkeys.length === 0)
        throw new functions.https.HttpsError('failed-precondition', 'No Passkeys found.');
    const options = await (0, server_1.generateAuthenticationOptions)({
        rpID, allowCredentials: passkeys.map((p) => ({ id: p.credentialID, type: 'public-key', transports: p.transports })),
        userVerification: 'preferred',
    });
    await db.collection('users').doc(userDoc.id).collection('challenges').doc('authentication').set({
        challenge: options.challenge, createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return options;
});
// HTTP endpoint for generateAuthOptions (for CORS support)
exports.generateAuthOptionsHTTP = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        if (req.method === 'POST') {
            try {
                const { email } = req.body;
                if (!email)
                    return res.status(400).json({ error: 'Email required' });
                const userSnapshot = await db.collection('users').where('email', '==', email).limit(1).get();
                if (userSnapshot.empty)
                    return res.status(404).json({ error: 'Identity not found' });
                const userDoc = userSnapshot.docs[0];
                const passkeys = userDoc.data()?.passkeys || [];
                if (passkeys.length === 0)
                    return res.status(412).json({ error: 'No Passkeys found' });
                const options = await (0, server_1.generateAuthenticationOptions)({
                    rpID, allowCredentials: passkeys.map((p) => ({ id: p.credentialID, type: 'public-key', transports: p.transports })),
                    userVerification: 'preferred',
                });
                await db.collection('users').doc(userDoc.id).collection('challenges').doc('authentication').set({
                    challenge: options.challenge, createdAt: admin.firestore.FieldValue.serverTimestamp(),
                });
                res.json(options);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        }
        else {
            res.status(405).json({ error: 'Method not allowed' });
        }
    });
});
exports.verifyAuthResponse = functions.https.onCall(async (request) => {
    const { body, email } = request.data;
    const userSnapshot = await db.collection('users').where('email', '==', email).limit(1).get();
    if (userSnapshot.empty)
        throw new functions.https.HttpsError('not-found', 'Identity not found.');
    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data() || {};
    const passkey = (userData.passkeys || []).find((p) => p.credentialID === body.id);
    if (!passkey)
        throw new functions.https.HttpsError('not-found', 'Passkey not recognized.');
    const challengeDoc = await db.collection('users').doc(userDoc.id).collection('challenges').doc('authentication').get();
    const expectedChallenge = challengeDoc.data()?.challenge;
    if (!expectedChallenge)
        throw new functions.https.HttpsError('failed-precondition', 'Challenge expired.');
    try {
        const verification = await (0, server_1.verifyAuthenticationResponse)({
            response: body, expectedChallenge, expectedOrigin: origin, expectedRPID: rpID,
            authenticator: { credentialID: Buffer.from(passkey.credentialID, 'base64'), credentialPublicKey: Buffer.from(passkey.publicKey, 'base64'), counter: passkey.counter },
        });
        if (verification.verified) {
            const customToken = await admin.auth().createCustomToken(userDoc.id);
            return { verified: true, customToken };
        }
        return { verified: false };
    }
    catch (error) {
        throw new functions.https.HttpsError('internal', error.message);
    }
});
/**
 * CREATE AUTH TOKEN - Biometric Login
 * After WebAuthn verification succeeds, create a custom Firebase auth token
 */
exports.createBiometricAuthToken = functions.https.onCall(async (data, context) => {
    const { email } = data;
    if (!email) {
        throw new functions.https.HttpsError('invalid-argument', 'Email is required');
    }
    try {
        // Find user by email
        const userQuery = await db.collection('users').where('email', '==', email).get();
        if (userQuery.empty) {
            throw new functions.https.HttpsError('not-found', 'User not found');
        }
        const userDoc = userQuery.docs[0];
        const uid = userDoc.id;
        // Verify biometric is enabled for this user
        const userData = userDoc.data();
        if (!userData.webauthnEnabled) {
            throw new functions.https.HttpsError('failed-precondition', 'Biometric not enabled for this account');
        }
        // Create custom auth token
        const customToken = await admin.auth().createCustomToken(uid);
        return { token: customToken, uid };
    }
    catch (error) {
        console.error('Error creating biometric auth token:', error);
        throw new functions.https.HttpsError('internal', 'Failed to create auth token');
    }
});
/**
 * HATI AUTHORITY: Elevate User to Admin
 * Accessible only with valid super admin privileges (you can call from console first)
 */
exports.elevateUserToAdmin = functions.https.onCall(async (data, context) => {
    // For initial setup, allow if no admins exist yet
    const adminUsersQuery = await db.collection('users').where('role', '==', 'super_admin').get();
    const isFirstSetup = adminUsersQuery.empty;
    if (!context.auth && !isFirstSetup) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }
    if (!isFirstSetup) {
        const requester = await admin.auth().getUser(context.auth.uid);
        const requesterToken = await admin.auth().getUser(context.auth.uid).then(u => u.customClaims);
        if (requesterToken?.role !== 'super_admin') {
            throw new functions.https.HttpsError('permission-denied', 'Only super admins can elevate users');
        }
    }
    const { email } = data;
    if (!email) {
        throw new functions.https.HttpsError('invalid-argument', 'Email is required');
    }
    try {
        const user = await admin.auth().getUserByEmail(email);
        await admin.auth().setCustomUserClaims(user.uid, {
            role: 'super_admin',
            elevatedAt: Date.now()
        });
        await db.collection('users').doc(user.uid).set({
            role: 'super_admin',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        return {
            success: true,
            message: `User ${email} has been elevated to super_admin. They must logout and log back in.`,
            uid: user.uid
        };
    }
    catch (error) {
        console.error('Elevation error:', error);
        throw new functions.https.HttpsError('internal', `Failed to elevate user: ${error.message}`);
    }
});
/**
 * HATI GUARDIAN PROTOCOL - VITAL SIGNS MONITOR
 * Runs every 24 hours to check for inactive Guardians.
 */
exports.monitorVitalSigns = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
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
exports.inviteGuardian = functions.https.onCall(async (data, context) => {
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
/**
 * SEND GUARDIAN INVITATION EMAIL
 * Sends invitation to newly added guardian
 */
exports.sendGuardianInvite = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }
    const { guardianEmail, guardianName, ownerName } = data;
    if (!guardianEmail || !guardianName || !ownerName) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
    }
    try {
        const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
        if (!SENDGRID_API_KEY) {
            console.warn('[SENDGRID_MOCK] Email notification system not configured');
            console.log(`[EMAIL_MOCK] To: ${guardianEmail}`);
            console.log(`Subject: You've been appointed as ${ownerName}'s Medical Guardian`);
            console.log(`Body: Hello ${guardianName}, ${ownerName} has designated you as their Medical Guardian on Hati. Click here to create your account and verify your identity.`);
            return { success: true, method: 'mock' };
        }
        // Production: Send via SendGrid
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(SENDGRID_API_KEY);
        const msg = {
            to: guardianEmail,
            from: 'noreply@hati-certified.com',
            subject: `You've been appointed as ${ownerName}'s Medical Guardian`,
            html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2>Medical Guardian Assignment</h2>
          <p>Hello ${guardianName},</p>
          <p><strong>${ownerName}</strong> has designated you as their Medical Guardian on HATI.</p>
          <p>This means you'll have access to their medical records and health information in case of emergency.</p>
          <p><a href="https://hati-certified.web.app/signup" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Create Guardian Account</a></p>
          <p>Questions? Contact support@hati-certified.com</p>
        </div>
      `
        };
        await sgMail.send(msg);
        return { success: true, method: 'sendgrid' };
    }
    catch (error) {
        console.error('Guardian invitation error:', error);
        throw new functions.https.HttpsError('internal', 'Failed to send invitation');
    }
});
/**
 * SEND PAYMENT CONFIRMATION EMAIL
 * Confirms successful payment and premium access
 */
exports.sendPaymentConfirmation = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }
    const { userEmail, userName, amount, reference, expiryDate } = data;
    if (!userEmail || !userName || !amount) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
    }
    try {
        const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
        if (!SENDGRID_API_KEY) {
            console.warn('[SENDGRID_MOCK] Email notification system not configured');
            console.log(`[EMAIL_MOCK] To: ${userEmail}`);
            console.log(`Subject: Payment Confirmation - HATI Premium Access`);
            console.log(`Body: Thank you ${userName}! Your payment of ${amount} has been received. Premium access until ${expiryDate}`);
            return { success: true, method: 'mock' };
        }
        // Production: Send via SendGrid
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(SENDGRID_API_KEY);
        const msg = {
            to: userEmail,
            from: 'billing@hati-certified.com',
            subject: 'Payment Confirmation - HATI Premium Access',
            html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2>Payment Received ✓</h2>
          <p>Hello ${userName},</p>
          <p>Thank you! Your payment has been successfully processed.</p>
          <h3>Payment Details</h3>
          <ul>
            <li>Amount: KES ${amount}</li>
            <li>Reference: ${reference}</li>
            <li>Access until: ${expiryDate}</li>
          </ul>
          <p>Your HATI Premium account is now fully activated. You can:</p>
          <ul>
            <li>Add medical guardians</li>
            <li>Upload and secure medical records</li>
            <li>Create inheritance plans</li>
            <li>Get health insights and recommendations</li>
          </ul>
          <p><a href="https://hati-certified.web.app/login" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Access Your Vault</a></p>
        </div>
      `
        };
        await sgMail.send(msg);
        return { success: true, method: 'sendgrid' };
    }
    catch (error) {
        console.error('Payment confirmation error:', error);
        throw new functions.https.HttpsError('internal', 'Failed to send confirmation');
    }
});
/**
 * SEND CAMPAIGN NOTIFICATION
 * Send email or WhatsApp campaign messages
 */
exports.sendCampaignNotification = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }
    // Check admin role
    const requesterDoc = await db.collection('users').doc(context.auth.uid).get();
    if (requesterDoc.data()?.role !== 'super_admin') {
        throw new functions.https.HttpsError('permission-denied', 'Admin access required');
    }
    const { recipientEmail, recipientPhone, subject, message, campaignType } = data;
    if (!recipientEmail && !recipientPhone) {
        throw new functions.https.HttpsError('invalid-argument', 'Email or phone required');
    }
    try {
        // Email campaign
        if (recipientEmail && campaignType !== 'whatsapp') {
            const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
            if (!SENDGRID_API_KEY) {
                console.log(`[EMAIL_MOCK] To: ${recipientEmail}`);
                console.log(`Subject: ${subject}`);
                console.log(`Body: ${message}`);
                return { success: true, method: 'mock', type: 'email' };
            }
            const sgMail = require('@sendgrid/mail');
            sgMail.setApiKey(SENDGRID_API_KEY);
            await sgMail.send({
                to: recipientEmail,
                from: 'campaigns@hati-certified.com',
                subject: subject,
                html: `<div style="font-family: Arial, sans-serif; padding: 20px;">${message}</div>`
            });
            return { success: true, method: 'sendgrid', type: 'email' };
        }
        // WhatsApp campaign
        if (recipientPhone && (campaignType === 'whatsapp' || campaignType === 'sms')) {
            const TWILIO_API_KEY = process.env.TWILIO_API_KEY;
            const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
            if (!TWILIO_API_KEY || !TWILIO_ACCOUNT_SID) {
                console.log(`[WHATSAPP_MOCK] To: ${recipientPhone}`);
                console.log(`Message: ${message}`);
                return { success: true, method: 'mock', type: 'whatsapp' };
            }
            const twilio = require('twilio');
            const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_API_KEY);
            await client.messages.create({
                body: message,
                from: `whatsapp:+${process.env.TWILIO_WHATSAPP_FROM}`,
                to: `whatsapp:+${recipientPhone}`
            });
            return { success: true, method: 'twilio', type: 'whatsapp' };
        }
        return { success: true };
    }
    catch (error) {
        console.error('Campaign notification error:', error);
        throw new functions.https.HttpsError('internal', 'Failed to send campaign');
    }
});
/**
 * SEND EMERGENCY ALERT
 * Sends urgent notification to guardians during emergency
 */
exports.sendEmergencyAlert = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }
    const { guardianEmail, guardianPhone, ownerName, emergencyType } = data;
    if (!guardianEmail && !guardianPhone) {
        throw new functions.https.HttpsError('invalid-argument', 'Email or phone required');
    }
    try {
        const emergencyMessage = `URGENT: ${ownerName} has triggered an emergency alert on HATI. You have been designated as their Medical Guardian. Access their medical records immediately at: https://hati-certified.web.app/emergency`;
        // Send email
        if (guardianEmail) {
            const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
            if (!SENDGRID_API_KEY) {
                console.log(`[EMAIL_EMERGENCY] To: ${guardianEmail}`);
                console.log(`Subject: URGENT - Medical Emergency Alert`);
                console.log(`Body: ${emergencyMessage}`);
            }
            else {
                const sgMail = require('@sendgrid/mail');
                sgMail.setApiKey(SENDGRID_API_KEY);
                await sgMail.send({
                    to: guardianEmail,
                    from: 'emergency@hati-certified.com',
                    subject: '🚨 URGENT - Medical Emergency Alert',
                    html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #fff3cd; border: 2px solid #dc3545; border-radius: 5px;">
              <h2 style="color: #dc3545;">🚨 EMERGENCY ALERT</h2>
              <p><strong>${ownerName}</strong> has triggered an emergency alert on HATI.</p>
              <p>As their designated Medical Guardian, you have immediate access to their medical records and health information.</p>
              <p><a href="https://hati-certified.web.app/emergency" style="background-color: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">ACCESS EMERGENCY RECORDS NOW</a></p>
            </div>
          `
                });
            }
        }
        // Send WhatsApp
        if (guardianPhone) {
            const TWILIO_API_KEY = process.env.TWILIO_API_KEY;
            const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
            if (!TWILIO_API_KEY || !TWILIO_ACCOUNT_SID) {
                console.log(`[WHATSAPP_EMERGENCY] To: ${guardianPhone}`);
                console.log(`Message: ${emergencyMessage}`);
            }
            else {
                const twilio = require('twilio');
                const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_API_KEY);
                await client.messages.create({
                    body: emergencyMessage,
                    from: `whatsapp:+${process.env.TWILIO_WHATSAPP_FROM}`,
                    to: `whatsapp:+${guardianPhone}`
                });
            }
        }
        return { success: true };
    }
    catch (error) {
        console.error('Emergency alert error:', error);
        throw new functions.https.HttpsError('internal', 'Failed to send emergency alert');
    }
});
// Gemini AI Medical Document Extraction
exports.extractMedicalData = functions.https.onCall(async (request) => {
    const uid = request.auth?.uid;
    if (!uid)
        throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    const { base64Image } = request.data;
    if (!base64Image)
        throw new functions.https.HttpsError('invalid-argument', 'No image provided');
    try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const ai = new GoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
        const systemInstruction = `
      ACT AS A SENIOR MEDICAL SCRIBE. 
      Analyze the provided medical document image (could be handwritten). 
      Return a valid JSON object ONLY. 
      
      CRITICAL RULES:
      1. If handwriting is ILLEGIBLE, use "Handwriting Needs Review" as a diagnosis.
      2. CHECK INTERACTIONS: If multiple meds are found (e.g., Warfarin + Ibuprofen), add a warning.
      3. VITALS: Only include if explicitly stated in the document.
    `;
        const prompt = "Please analyze this medical document and extract structured patient data, diagnoses, medications, and vitals according to the defined schema.";
        const model = ai.getGenerativeModel({ model: 'gemini-1.5-pro' });
        const response = await model.generateContent({
            contents: [
                {
                    parts: [
                        {
                            inlineData: {
                                mimeType: 'image/jpeg',
                                data: base64Image.split(',')[1] || base64Image,
                            },
                        },
                        { text: `${systemInstruction}\n\n${prompt}` }
                    ],
                },
            ],
        });
        const jsonStr = response.response.text().trim();
        const parsedData = JSON.parse(jsonStr);
        return {
            patient_name: parsedData.patient_name || 'Unknown Patient',
            date: parsedData.date || new Date().toISOString().split('T')[0],
            diagnosis: Array.isArray(parsedData.diagnosis) ? parsedData.diagnosis : ['Not specified'],
            medications: Array.isArray(parsedData.medications) ? parsedData.medications : [],
            allergies: Array.isArray(parsedData.allergies) ? parsedData.allergies : [],
            vitals: {
                systolic: parsedData.vitals?.systolic || 0,
                diastolic: parsedData.vitals?.diastolic || 0,
                heartRate: parsedData.vitals?.heart_rate || parsedData.vitals?.heartRate || 0,
                temperature: parsedData.vitals?.temperature || 0,
                glucose: parsedData.vitals?.glucose || 0
            },
            warnings: Array.isArray(parsedData.warnings) ? parsedData.warnings : []
        };
    }
    catch (error) {
        console.error('Gemini Extraction Error:', error);
        throw new functions.https.HttpsError('internal', 'Could not process document. Ensure high lighting and clarity.');
    }
});
