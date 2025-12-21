# HATI Admin Configuration Guide

## Quick Setup: Adding Your First Configurations to Firebase

Follow these steps to set up the dynamic configurations that power the app.

---

## Step 1: Business Settings (Pricing)

### Location in Firebase Console
```
Firestore Database
└── Collections
    └── config
        └── Document: "business_settings"
```

### Document Structure
Create a document with ID `business_settings` in the `config` collection:

```json
{
  "guardianMonthlyPrice": 299,
  "guardianYearlyPrice": 2999,
  "yearlyDiscountPercent": 20,
  "currency": "KES",
  "currencySymbol": "Ksh",
  "trialDays": 7,
  "maxProfiles": 5,
  "updatedAt": 1704067200
}
```

### Field Descriptions
| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `guardianMonthlyPrice` | Number | Yes | Monthly subscription price | 299 |
| `guardianYearlyPrice` | Number | Yes | Annual subscription price | 2999 |
| `yearlyDiscountPercent` | Number | Yes | Discount % for annual plan | 20 |
| `currency` | String | Yes | Currency code | "KES" |
| `currencySymbol` | String | Yes | Currency symbol for display | "Ksh" |
| `trialDays` | Number | Optional | Free trial period | 7 |
| `maxProfiles` | Number | Optional | Max family profiles allowed | 5 |

### How It's Used
- **UpgradeButton.tsx**: Reads `guardianMonthlyPrice` and `guardianYearlyPrice` to display in upgrade card
- Displays: `"Ksh 299/month"` or `"Ksh 2999/year (save 20%)"`

### Test It
1. In Firebase Console, update `guardianMonthlyPrice` to 399
2. Refresh the app
3. Upgrade button should now show "Ksh 399/month"

---

## Step 2: Promo Codes

### Location in Firebase Console
```
Firestore Database
└── Collections
    └── config
        └── Document: "promo_codes"
```

### Document Structure
Create a document with ID `promo_codes` in the `config` collection with fields for each code:

```json
{
  "SAVE20": {
    "discountPercent": 20,
    "discountAmount": 0,
    "maxUses": 100,
    "usedCount": 0,
    "active": true,
    "expiresAt": 1735689600,
    "description": "Save 20% on any plan"
  },
  "LAUNCH50": {
    "discountPercent": 0,
    "discountAmount": 500,
    "maxUses": 50,
    "usedCount": 49,
    "active": false,
    "expiresAt": 1704153600,
    "description": "Save Ksh 500 fixed amount"
  },
  "VIP100": {
    "discountPercent": 50,
    "discountAmount": 0,
    "maxUses": 10,
    "usedCount": 3,
    "active": true,
    "expiresAt": 1767225600,
    "description": "VIP customer special"
  }
}
```

### Promo Code Fields
| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `[CODE_NAME]` | Object | Yes | Code name in UPPERCASE | "SAVE20" |
| `.discountPercent` | Number | Yes* | Percentage discount (0 if using fixed) | 20 |
| `.discountAmount` | Number | Yes* | Fixed amount discount in currency (0 if using %) | 500 |
| `.maxUses` | Number | Yes | Maximum number of times code can be used | 100 |
| `.usedCount` | Number | Yes | How many times code has been used | 0 |
| `.active` | Boolean | Yes | Whether code is currently valid | true |
| `.expiresAt` | Timestamp | Optional | Unix timestamp when code expires | 1735689600 |
| `.description` | String | Optional | Internal note about the code | "Launch special" |

*One of `discountPercent` or `discountAmount` must be > 0

### How It's Used
- **MpesaPaymentModal.tsx**: Loads all codes from this document
- User enters code during payment checkout
- App validates: active, not expired, not at max uses
- Calculates discount and applies to payment amount
- After successful payment, increments `usedCount`

### Discount Logic
```javascript
// If percentage discount
discount = amount * (discountPercent / 100)  // Ksh 299 * 20% = Ksh 59.80

// If fixed discount
discount = discountAmount  // Ksh 500

// Final amount user pays
finalAmount = amount - discount  // Ksh 299 - Ksh 59.80 = Ksh 239.20
```

### Test It
1. In Firebase Console, add new field to `promo_codes`:
   ```json
   "TEST10": {
     "discountPercent": 10,
     "maxUses": 5,
     "usedCount": 0,
     "active": true
   }
   ```
2. Go to app, add item to cart, enter "TEST10"
3. Should see 10% discount applied

---

## Step 3: Marketing Messages

### Location in Firebase Console
```
Firestore Database
└── Collections
    └── config
        └── Document: "marketing_settings"
```

### Document Structure
Create a document with ID `marketing_settings` in the `config` collection:

```json
{
  "paywallTitle": "Unlock Guardian Protocol",
  "paywallSubtitle": "Premium medical data protection and family sharing",
  "fomoMessage": "Only 3 spots left for new members this month!",
  "footerText": "Trusted by 10,000+ families in East Africa",
  "updatedAt": 1704067200
}
```

### Marketing Fields
| Field | Type | Required | Description | Example | Appears In |
|-------|------|----------|-------------|---------|-----------|
| `paywallTitle` | String | Yes | Main heading on upgrade screen | "Unlock Guardian" | FeaturePaywall |
| `paywallSubtitle` | String | Yes | Subheading on upgrade screen | "Premium protection" | FeaturePaywall |
| `fomoMessage` | String | Optional | FOMO/urgency message | "Only 3 spots left!" | FeaturePaywall banner |
| `footerText` | String | Optional | Trust/social proof message | "Trusted by 10k+" | Footer |
| `ctaButtonText` | String | Optional | Upgrade button text | "Unlock Now" | Button |

### How It's Used
- **FeaturePaywall.tsx**: Reads these messages and displays on upgrade screen
- Updates show immediately without reloading app
- Allows A/B testing different messaging

### Examples for Different Seasons
**New Year Campaign:**
```json
{
  "paywallTitle": "2025: Your Health, Protected",
  "paywallSubtitle": "New year resolution: secure your family's medical records",
  "fomoMessage": "New Year special: 40% off annual plans this week only!"
}
```

**Emergency/Trust Building:**
```json
{
  "paywallTitle": "When Health Emergencies Happen",
  "paywallSubtitle": "Instant access to complete medical history, anywhere, anytime",
  "fomoMessage": "Be prepared: 1 in 4 families need medical records in an emergency"
}
```

### Test It
1. Update `fomoMessage` to "Test message 123"
2. Refresh app and try to use a locked feature
3. Paywall should show your new message

---

## Step 4: Campaigns (Dashboard Messages)

### Location in Firebase Console
```
Firestore Database
└── Collections
    └── campaigns
        └── Documents: "campaign_001", "campaign_002", etc.
```

### Document Structure
Create new documents in the `campaigns` collection:

```json
{
  "title": "Biometric Login Now Available",
  "message": "Secure your vault with fingerprint or face recognition. No password needed.",
  "ctaText": "Enable Now",
  "ctaUrl": "/settings/security",
  "targetSegments": ["all"],
  "active": true,
  "createdAt": 1704067200,
  "priority": 1
}
```

### Campaign Fields
| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `title` | String | Yes | Campaign headline | "Spring Update Live" |
| `message` | String | Yes | Campaign body text | "Your vault now supports..." |
| `ctaText` | String | Optional | Call-to-action button text | "Learn More" |
| `ctaUrl` | String | Optional | URL when CTA clicked | "/settings" |
| `targetSegments` | Array | Yes | Who sees this ["all", "premium", "free"] | ["all"] |
| `active` | Boolean | Yes | Whether campaign is live | true |
| `createdAt` | Number | Yes | Unix timestamp | 1704067200 |
| `priority` | Number | Optional | Higher = shows first | 1 |
| `expiresAt` | Number | Optional | Unix timestamp when to stop showing | 1735689600 |

### Target Segments
- `"all"` - All users
- `"premium"` - Users with Guardian/premium plan
- `"free"` - Free tier users
- `"new"` - Users created in last 7 days
- `"inactive"` - Didn't login in 30 days

### How It's Used
- **Dashboard.tsx**: Loads active campaigns from this collection
- Filters by `targetSegments` matching user
- Shows banner at top of medical vault
- User can dismiss with X button

### Campaign Examples

**Feature Announcement:**
```json
{
  "title": "New: Emergency Share",
  "message": "Share your medical records with emergency contacts in 30 seconds. No passwords needed.",
  "ctaText": "Set Up Emergency Share",
  "targetSegments": ["all"],
  "active": true,
  "priority": 2
}
```

**Win-Back Campaign:**
```json
{
  "title": "We Miss You!",
  "message": "Haven't seen you in a while. Come back to see your vault and check your medical timeline.",
  "ctaText": "Go to Vault",
  "targetSegments": ["inactive"],
  "active": true,
  "priority": 1
}
```

**Upsell Campaign:**
```json
{
  "title": "Upgrade to Guardian",
  "message": "Get family profiles, biometric login, and inheritance planning. Try free for 7 days.",
  "ctaText": "Start Free Trial",
  "targetSegments": ["free"],
  "active": true,
  "priority": 3
}
```

### Test It
1. Create new document in `campaigns` collection:
   ```json
   {
     "title": "Test Campaign",
     "message": "This is a test message",
     "targetSegments": ["all"],
     "active": true
   }
   ```
2. Open Dashboard
3. Should see banner at top with your message
4. Click X to dismiss

---

## Firebase Console Checklist

### Initial Setup
- [ ] Create `config` collection
- [ ] Create `config/business_settings` document with pricing
- [ ] Create `config/promo_codes` document with codes
- [ ] Create `config/marketing_settings` document with messages
- [ ] Create `campaigns` collection
- [ ] Create first campaign document

### Before Launch
- [ ] Review all pricing in `business_settings`
- [ ] Ensure active promo codes have `active: true`
- [ ] Check marketing messages for typos
- [ ] Verify at least one campaign exists for testing
- [ ] Test each integration in app before going live

### Ongoing Maintenance
- [ ] Monitor `usedCount` on promo codes
- [ ] Update campaigns weekly with fresh messaging
- [ ] Rotate marketing messages seasonally
- [ ] Archive expired campaigns (set `active: false`)
- [ ] Keep pricing updated when costs change

---

## Common Issues & Solutions

### Pricing not updating
**Problem:** UpgradeButton still shows old price  
**Solution:**
1. Verify document ID is exactly `business_settings`
2. Verify it's in `config` collection (not at root)
3. Refresh app fully (hard refresh Ctrl+Shift+R)
4. Check browser console for Firebase errors

### Promo code not working
**Problem:** User enters code but no discount applies  
**Solution:**
1. Check code is in uppercase in Firestore
2. Verify `active: true`
3. Check `usedCount < maxUses`
4. Check timestamp: `expiresAt > currentTime`
5. Verify one of `discountPercent` or `discountAmount` is > 0

### Campaign not showing
**Problem:** Dashboard doesn't show campaign banner  
**Solution:**
1. Check `active: true`
2. Check user segment in `targetSegments` array (try ["all"])
3. Verify document is in `campaigns` collection
4. Open browser dev console for errors

### Messages showing as blank
**Problem:** Fields display but show empty values  
**Solution:**
1. Check field names match exactly (case-sensitive)
2. Add fallback text if field missing
3. Verify Firestore security rules allow reads

---

## API Reference

### Business Settings Document
**Path:** `/config/business_settings`  
**Read by:** UpgradeButton.tsx on component mount  
**Update frequency:** Real-time on changes

### Promo Codes Document
**Path:** `/config/promo_codes`  
**Read by:** MpesaPaymentModal.tsx on component mount  
**Update frequency:** Real-time, plus usedCount incremented after payment

### Marketing Settings Document
**Path:** `/config/marketing_settings`  
**Read by:** FeaturePaywall.tsx on component mount  
**Update frequency:** Real-time on changes

### Campaigns Collection
**Path:** `/campaigns/{campaignId}`  
**Read by:** Dashboard.tsx on component mount  
**Update frequency:** Real-time, filtered by targetSegments

---

## Need Help?

Check these files for implementation details:
- **Pricing:** [app/login/components/UpgradeButton.tsx](../app/login/components/UpgradeButton.tsx)
- **Promo:** [app/login/components/MpesaPaymentModal.tsx](../app/login/components/MpesaPaymentModal.tsx)
- **Marketing:** [app/login/components/FeaturePaywall.tsx](../app/login/components/FeaturePaywall.tsx)
- **Campaigns:** [app/login/components/Dashboard.tsx](../app/login/components/Dashboard.tsx)
