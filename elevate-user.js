import admin from 'firebase-admin';

// Use Application Default Credentials or service account from environment
// Make sure FIREBASE_CONFIG environment variable is set with your service account JSON
let serviceAccount;

try {
  if (process.env.FIREBASE_CONFIG) {
    serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);
  } else {
    // Try to read from current directory or parent directory
    const { readFileSync } = await import('fs');
    const { join } = await import('path');
    const possiblePaths = [
      'hati-certified-firebase-key.json',
      '../hati-certified-firebase-key.json',
      './hati-certified-firebase-key.json'
    ];
    
    for (const path of possiblePaths) {
      try {
        serviceAccount = JSON.parse(readFileSync(path, 'utf8'));
        console.log(`✅ Loaded service account from: ${path}`);
        break;
      } catch (e) {
        // Try next path
      }
    }
  }
  
  if (!serviceAccount) {
    // Try the exact filename
    try {
      const { readFileSync } = await import('fs');
      serviceAccount = JSON.parse(readFileSync('hati-certified-firebase-adminsdk-fbsvc-856ad3c65d.json', 'utf8'));
      console.log(`✅ Loaded service account from: hati-certified-firebase-adminsdk-fbsvc-856ad3c65d.json`);
    } catch (e) {
      throw new Error('Service account credentials not found');
    }
  }
} catch (error) {
  console.error('❌ Error loading service account:', error.message);
  console.error('Please provide FIREBASE_CONFIG environment variable or place hati-certified-firebase-key.json in the project root');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
});

const email = process.argv[2];

if (!email) {
  console.error('Usage: node elevate-user.js <email>');
  process.exit(1);
}

async function elevateToAdmin(userEmail) {
  try {
    console.log(`🔑 HATI_AUTHORITY: Initiating elevation for ${userEmail}...`);
    
    // 1. Fetch user from Auth
    const user = await admin.auth().getUserByEmail(userEmail);
    console.log(`✓ Found user: ${user.uid}`);
    
    // 2. Set Custom Claims (RBAC Security Layer)
    await admin.auth().setCustomUserClaims(user.uid, { 
      role: 'admin',
      elevatedAt: new Date().toISOString()
    });
    console.log(`✓ Custom claims set for user`);
    
    // 3. Update Firestore (UI Visibility Layer)
    await admin.firestore().collection('users').doc(user.uid).set({
      role: 'admin',
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    console.log(`\n✅ HATI_AUTHORITY: SUCCESS!`);
    console.log(`📧 ${userEmail} has been granted Admin clearance.`);
    console.log(`⚠️  User must LOGOUT and LOGIN again for claims to refresh.\n`);
    
    process.exit(0);
  } catch (error) {
    console.error(`\n❌ HATI_AUTHORITY: ELEVATION_FAILED`);
    console.error(`Error: ${error.message}\n`);
    process.exit(1);
  }
}

elevateToAdmin(email);
