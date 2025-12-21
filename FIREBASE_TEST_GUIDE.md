// HATI Firebase Configuration Validation & Testing Guide
// Use these code snippets to verify all integrations are working

// ============================================================================
// 1. TEST PRICING (UpgradeButton.tsx)
// ============================================================================

import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

async function testPricing() {
  try {
    const configDoc = await getDoc(doc(db, 'config', 'business_settings'));
    if (configDoc.exists()) {
      const config = configDoc.data();
      console.log('✅ Pricing Config Found:', {
        monthlyPrice: config.guardianMonthlyPrice,
        yearlyPrice: config.guardianYearlyPrice,
        discount: config.yearlyDiscountPercent + '%',
        currency: config.currencySymbol
      });
      return config;
    } else {
      console.error('❌ No business_settings document found');
      console.log('Create document: /config/business_settings with fields:');
      console.log({
        guardianMonthlyPrice: 299,
        guardianYearlyPrice: 2999,
        yearlyDiscountPercent: 20,
        currencySymbol: 'Ksh'
      });
    }
  } catch (error) {
    console.error('❌ Error fetching pricing:', error);
  }
}

// Expected output:
// ✅ Pricing Config Found: {
//   monthlyPrice: 299,
//   yearlyPrice: 2999,
//   discount: 20%,
//   currency: Ksh
// }

// ============================================================================
// 2. TEST PROMO CODES (MpesaPaymentModal.tsx)
// ============================================================================

async function testPromoCode(codeToTest = 'SAVE20') {
  try {
    const configDoc = await getDoc(doc(db, 'config', 'promo_codes'));
    if (configDoc.exists()) {
      const allCodes = configDoc.data();
      const code = allCodes[codeToTest];
      
      if (!code) {
        console.error(`❌ Promo code "${codeToTest}" not found`);
        console.log('Available codes:', Object.keys(allCodes));
        return false;
      }

      // Validation logic (same as MpesaPaymentModal)
      if (!code.active) {
        console.error(`❌ Code "${codeToTest}" is inactive`);
        return false;
      }

      if (code.usedCount >= code.maxUses) {
        console.error(`❌ Code "${codeToTest}" reached max uses (${code.maxUses})`);
        return false;
      }

      // Calculate discount
      const testAmount = 299;
      let discount = 0;
      if (code.discountPercent > 0) {
        discount = Math.round(testAmount * (code.discountPercent / 100));
      } else if (code.discountAmount > 0) {
        discount = code.discountAmount;
      }

      console.log(`✅ Code "${codeToTest}" is valid:`, {
        discount: discount,
        discountPercent: code.discountPercent,
        discountAmount: code.discountAmount,
        used: code.usedCount + '/' + code.maxUses,
        finalAmount: testAmount - discount
      });
      
      return true;
    } else {
      console.error('❌ No promo_codes document found');
      console.log('Create document: /config/promo_codes with structure:');
      console.log({
        SAVE20: {
          discountPercent: 20,
          maxUses: 100,
          usedCount: 0,
          active: true
        }
      });
    }
  } catch (error) {
    console.error('❌ Error fetching promo codes:', error);
  }
}

// testPromoCode('SAVE20')
// Expected output:
// ✅ Code "SAVE20" is valid: {
//   discount: 59.80,
//   used: 0/100,
//   finalAmount: 239.20
// }

// ============================================================================
// 3. TEST MARKETING MESSAGES (FeaturePaywall.tsx)
// ============================================================================

async function testMarketingMessages() {
  try {
    const configDoc = await getDoc(doc(db, 'config', 'marketing_settings'));
    if (configDoc.exists()) {
      const config = configDoc.data();
      console.log('✅ Marketing Messages Found:', {
        paywallTitle: config.paywallTitle,
        paywallSubtitle: config.paywallSubtitle,
        fomoMessage: config.fomoMessage
      });
      return config;
    } else {
      console.error('❌ No marketing_settings document found');
      console.log('Create document: /config/marketing_settings with fields:');
      console.log({
        paywallTitle: 'Unlock Guardian Protocol',
        paywallSubtitle: 'Premium medical protection',
        fomoMessage: 'Limited time offer!'
      });
    }
  } catch (error) {
    console.error('❌ Error fetching marketing messages:', error);
  }
}

// Expected output:
// ✅ Marketing Messages Found: {
//   paywallTitle: "Unlock Guardian Protocol",
//   paywallSubtitle: "Premium medical protection",
//   fomoMessage: "Limited time offer!"
// }

// ============================================================================
// 4. TEST CAMPAIGNS (Dashboard.tsx)
// ============================================================================

import { query, collection, where, getDocs } from 'firebase/firestore';

async function testCampaigns(userSegment = 'all') {
  try {
    const campaignsRef = collection(db, 'campaigns');
    const campaignsSnapshot = await getDocs(campaignsRef);
    
    const allCampaigns = campaignsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const activeCampaigns = allCampaigns.filter(c => 
      c.active && c.targetSegments?.includes(userSegment)
    );

    if (activeCampaigns.length === 0) {
      console.warn('⚠️  No active campaigns for segment:', userSegment);
      console.log('All campaigns in database:', allCampaigns);
      console.log('Create document in /campaigns collection:');
      console.log({
        title: 'New Feature Launch',
        message: 'Check out our new biometric login!',
        targetSegments: ['all'],
        active: true
      });
      return;
    }

    console.log(`✅ Found ${activeCampaigns.length} active campaign(s) for "${userSegment}" segment:`, 
      activeCampaigns.map(c => ({
        id: c.id,
        title: c.title,
        message: c.message.substring(0, 50) + '...',
        segments: c.targetSegments
      }))
    );

    return activeCampaigns[0]; // Dashboard shows first active campaign
  } catch (error) {
    console.error('❌ Error fetching campaigns:', error);
  }
}

// testCampaigns('all')
// Expected output:
// ✅ Found 1 active campaign(s) for "all" segment: [
//   {
//     id: "campaign_001",
//     title: "New Feature Launch",
//     message: "Check out our new biometric login...",
//     segments: ["all"]
//   }
// ]

// ============================================================================
// 5. INTEGRATION TEST - All Components
// ============================================================================

async function runFullIntegrationTest() {
  console.log('\n🔍 HATI Firebase Configuration Test\n');
  
  console.log('1️⃣  Testing Pricing...');
  await testPricing();
  
  console.log('\n2️⃣  Testing Promo Codes...');
  await testPromoCode('SAVE20');
  
  console.log('\n3️⃣  Testing Marketing Messages...');
  await testMarketingMessages();
  
  console.log('\n4️⃣  Testing Campaigns...');
  await testCampaigns('all');
  
  console.log('\n✅ Integration test complete!\n');
}

// Run test: runFullIntegrationTest()

// ============================================================================
// 6. FIRESTORE SECURITY RULES (allow reads for users)
// ============================================================================

/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      allow read: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'super_admin';
    }
    
    // Public config collections - anyone can read
    match /config/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'super_admin';
    }
    
    // Campaigns - anyone can read
    match /campaigns/{campaignId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'super_admin';
    }
    
    // Audit logs - admin only
    match /audit_logs/{logId} {
      allow read, write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'super_admin';
    }
  }
}
*/

// ============================================================================
// 7. TYPESCRIPT TYPES (for reference)
// ============================================================================

interface BusinessSettings {
  guardianMonthlyPrice: number;
  guardianYearlyPrice: number;
  yearlyDiscountPercent: number;
  currency: string;
  currencySymbol: string;
  trialDays?: number;
}

interface PromoCode {
  discountPercent: number;
  discountAmount: number;
  maxUses: number;
  usedCount: number;
  active: boolean;
  expiresAt?: number;
}

interface PromoCodeMap {
  [codeId: string]: PromoCode;
}

interface MarketingSettings {
  paywallTitle: string;
  paywallSubtitle: string;
  fomoMessage?: string;
}

interface Campaign {
  title: string;
  message: string;
  ctaText?: string;
  ctaUrl?: string;
  targetSegments: string[]; // 'all', 'premium', 'free', 'new', 'inactive'
  active: boolean;
  createdAt: number;
  priority?: number;
  expiresAt?: number;
}

// ============================================================================
// 8. HOW TO RUN TESTS IN BROWSER CONSOLE
// ============================================================================

/*
1. Open app in browser
2. Open Developer Tools (F12 or Cmd+Shift+I)
3. Go to Console tab
4. Paste and run:

   import { testPricing, testPromoCode, testMarketingMessages, testCampaigns } from './your-test-file';
   
   // Or run one at a time:
   testPricing()
   testPromoCode('SAVE20')
   testMarketingMessages()
   testCampaigns('all')

Expected results show ✅ for working configurations
or ❌ with missing data structure info
*/

// ============================================================================
// 9. TROUBLESHOOTING CHECKLIST
// ============================================================================

const TROUBLESHOOTING = {
  'Pricing not updating': [
    '1. Check Firebase console: Collections > config > business_settings',
    '2. Verify field names: guardianMonthlyPrice (not guardianPrice)',
    '3. Hard refresh browser: Ctrl+Shift+R or Cmd+Shift+R',
    '4. Check browser console for errors: F12 > Console',
    '5. Verify Firestore rules allow reads'
  ],
  'Promo code not applying': [
    '1. Open Firebase console: Collections > config > promo_codes',
    '2. Check code is uppercase: SAVE20 not save20',
    '3. Verify: active: true',
    '4. Check: usedCount < maxUses',
    '5. Check: expiresAt timestamp is in future',
    '6. Test with testPromoCode() function'
  ],
  'Campaign not showing': [
    '1. Check: active: true in database',
    '2. Verify targetSegments includes "all"',
    '3. Refresh dashboard',
    '4. Check browser console for errors',
    '5. Run testCampaigns() function'
  ],
  'Marketing messages blank': [
    '1. Check field names exactly match: paywallTitle (camelCase)',
    '2. Verify marketing_settings document exists',
    '3. Check all required fields are present',
    '4. Run testMarketingMessages() function'
  ]
};

// Log troubleshooting guide
Object.entries(TROUBLESHOOTING).forEach(([issue, steps]) => {
  console.log(`\n${issue}:`);
  steps.forEach(step => console.log(`  ${step}`));
});
