# HATI Admin Workflow - Complete Guide

## Accessing the Admin Panel

### Location
```
https://your-app.com/=superhati
```

### Login Requirements
1. **Email**: Your admin email address
2. **Password**: Your master admin password
3. **Firebase Super Admin Role**: Must have `role: 'super_admin'` in Firestore `/users/{uid}`

### Step-by-Step Login
1. Navigate to `https://your-app.com/=superhati`
2. Enter your admin email
3. Click "Access Admin Panel"
4. Enter your password (same as Firebase auth password)
5. System verifies email exists in Firestore with `role: 'super_admin'`
6. Dashboard loads with admin controls

---

## Admin Dashboard Overview

The admin panel has 4 main sections:

```
ADMIN DASHBOARD
├── 1. User Management
│   ├── Promote User to Premium
│   ├── Ban User Account
│   └── Edit User Details
│
├── 2. Business Settings
│   ├── Set Monthly Price
│   ├── Set Yearly Price
│   ├── Set Yearly Discount %
│   └── Save Configuration
│
├── 3. Promo Codes
│   ├── Create New Code
│   ├── Set Discount Type (% or Fixed)
│   ├── Set Max Uses
│   └── Toggle Active Status
│
└── 4. Marketing & Campaigns
    ├── Update Paywall Messages
    ├── Set FOMO Message
    └── Send Campaign Messages
```

---

## 1. User Management

### Promote User to Premium

**What it does**: Instantly upgrades a user to Guardian/Premium tier with all premium features

**Process:**
1. Click "Users" tab in admin dashboard
2. Enter user's email address
3. Click "Promote to Premium"
4. Confirmation: "User promoted to Guardian plan"
5. User sees upgrade on next login

**Behind the scenes:**
- Updates Firestore: `/users/{userId}` with `isPremium: true, plan: 'guardian'`
- Logs action to `/audit_logs` with timestamp and admin email

**When to use:**
- Gifting premium to special users
- Closing a support ticket with premium upgrade
- VIP users or influencers
- Trial expired but manually granting access

---

### Ban User Account

**What it does**: Disables user access (soft ban - keeps data intact)

**Process:**
1. Click "Users" tab
2. Enter user's email address
3. Click "Ban User"
4. User immediately cannot login
5. Data is preserved in database

**Behind the scenes:**
- Updates: `/users/{userId}` with `status: 'banned'`
- Logs to `/audit_logs`
- User sees "Account Suspended" on next login attempt

**When to use:**
- Abuse or violation of terms
- Fraud detected
- Refund dispute
- User requests account suspension

---

### Edit User Details

**What it does**: Manually update user profile information

**Process:**
1. Click "Users" tab
2. Enter user's email
3. Update fields (name, contact, etc.)
4. Click "Save Changes"

**Editable fields:**
- User name
- Contact email
- Last active timestamp
- User role (if resetting)

---

## 2. Business Settings (Pricing)

### Update Guardian Monthly Price

**What it does**: Changes the monthly subscription price globally

**Process:**
1. Click "Settings" tab → "Business Configuration"
2. Find "Guardian Monthly Price"
3. Enter new price (e.g., 299 for Ksh 299)
4. Click "Save Configuration"
5. Price updates immediately across all components

**Result:**
- UpgradeButton shows new price: "Ksh 399/month"
- MpesaPaymentModal uses new price
- Existing premium users NOT affected (grandfathered)
- New signups pay new price

**Audit trail:**
- Logged to `/audit_logs` with old and new values
- Timestamp recorded
- Admin email recorded

---

### Update Guardian Yearly Price

**What it does**: Changes the annual subscription price

**Process:**
1. Click "Settings" tab → "Business Configuration"
2. Find "Guardian Yearly Price"
3. Enter new price (e.g., 2999 for Ksh 2999)
4. Click "Save Configuration"

**Best practice:**
- Yearly price should be ~10-20% cheaper than monthly × 12
- Example: Monthly 299 × 12 = 3588, Yearly = 2999 (saves 587)

---

### Update Yearly Discount Percentage

**What it does**: Shows discount percentage in upgrade button

**Process:**
1. Click "Settings" tab → "Business Configuration"
2. Find "Yearly Discount %"
3. Enter percentage (e.g., 20 for 20% off)
4. Click "Save Configuration"

**Display:**
- Button shows: "Ksh 2999/year (save 20%)"
- Helps encourage annual purchases

---

### Currency Settings

**Fields:**
- `currency`: Code like "KES", "USD", "GBP"
- `currencySymbol`: Display symbol like "Ksh", "$", "£"

**Process:**
1. Update both fields together
2. Click "Save Configuration"
3. All prices display with new currency symbol

**Example - Switching to USD:**
```
Old:
  currency: "KES"
  currencySymbol: "Ksh"
  monthlyPrice: 299

New:
  currency: "USD"
  currencySymbol: "$"
  monthlyPrice: 5
```

Result: Button shows "$ 5/month" instead of "Ksh 299/month"

---

## 3. Promo Codes Management

### Create New Promo Code

**What it does**: Creates a discount code users can enter at checkout

**Process:**
1. Click "Promo Codes" tab
2. Enter code name (e.g., "SAVE20" - must be uppercase)
3. Choose discount type:
   - **Percentage discount**: "20" = 20% off
   - **Fixed discount**: "500" = Ksh 500 off
4. Set max uses (e.g., 100 times can use this code)
5. Set expiration date (if any)
6. Click "Create Code"

**Code appears at:** `/config/promo_codes`
```json
{
  "SAVE20": {
    "discountPercent": 20,
    "discountAmount": 0,
    "maxUses": 100,
    "usedCount": 0,
    "active": true
  }
}
```

---

### Deactivate Promo Code

**Process:**
1. Go to Promo Codes tab
2. Find code you want to disable
3. Click "Deactivate"
4. Code immediately stops working for users

**Why deactivate vs delete:**
- Preserves usage statistics (learning what worked)
- Keep history of all campaigns
- Can reactivate if needed

---

### Monitor Promo Code Usage

**What you see:**
- Code name
- Discount amount
- Uses so far / Max uses (e.g., "47/100")
- Active/Inactive status
- Created date

**Example tracking:**
```
LAUNCH50
├─ Type: 50% off
├─ Uses: 47/100 (47% usage)
├─ Status: Active ✓
└─ Created: Jan 1, 2025
```

**When to archive:**
- Reached max uses (usedCount = maxUses)
- Campaign period ended
- Code performed poorly

---

## 4. Marketing & Campaigns

### Update Paywall Messages

**What it does**: Changes text shown when user tries to access premium feature

**Process:**
1. Click "Marketing Settings" tab
2. Update these fields:
   - **Title**: Main heading (e.g., "Unlock Guardian Protocol")
   - **Subtitle**: Secondary text (e.g., "Premium medical protection")
   - **FOMO Message**: Urgency message (e.g., "Only 3 spots left!")
3. Click "Save Settings"
4. Messages update immediately on paywall

**Where it appears:**
Users see this when clicking:
- "Add Family Members"
- "Enable Biometric Login"
- "View Analytics"
- Any Guardian-only feature

**Current paywall flow:**
```
User clicks locked feature
         ↓
Modal appears with:
├─ Title: "[Your Title]"
├─ Subtitle: "[Your Subtitle]"
├─ Plans: Monthly / Yearly pricing
├─ FOMO: "[Your FOMO Message]"
└─ Button: "Upgrade Now"
```

---

### A/B Testing Messages

**Strategy: Test different messaging to increase conversion**

**Example Test 1 - Emergency vs Features:**

Week 1: Focus on emergency use case
```
Title: "When Health Emergencies Happen"
Subtitle: "Instant access to complete medical history"
FOMO: "1 in 4 families need records in an emergency"
```

Week 2: Focus on family protection
```
Title: "Protect Your Family's Health"
Subtitle: "Secure family profiles and inheritance planning"
FOMO: "Join 10,000+ families protecting their future"
```

Compare upgrade rate after each week to see which resonates.

---

### Send Campaign Messages

**What it does**: Broadcasts message to users on their dashboard

**Process:**
1. Click "Campaigns" tab
2. Enter campaign details:
   - **Title**: Campaign name (e.g., "Spring Security Update")
   - **Message**: Campaign message (e.g., "Biometric login now available!")
   - **CTA Text**: Button text (e.g., "Enable Now")
   - **Target Segment**: Who to show to
     - "all" = everyone
     - "premium" = only paid users
     - "free" = only free tier
3. Click "Send Campaign"
4. Campaign appears as banner on user dashboards

**Where it appears:**
```
User opens Dashboard
         ↓
Sees banner at top:
┌─────────────────────────────┐
│ 📢 [Your Title]             │ [X]
│ [Your message text here]     │
│ [Enable Now] →              │
└─────────────────────────────┘
         ↓
User can click [X] to dismiss
or [Enable Now] to go to feature
```

**Campaign lifetime:**
- Appears immediately when created
- User can dismiss (doesn't show again)
- Set `active: false` to stop showing
- Keep history of campaigns

---

### Campaign Segmentation Examples

**Segment: "all" (everyone)**
```
Title: "Welcome to HATI"
Message: "Your medical records are now encrypted and secure"
Segments: ["all"]
```
*Show on first login to all new users*

**Segment: "free" (free tier users)**
```
Title: "Upgrade to Guardian"
Message: "Get family profiles and biometric login"
Segments: ["free"]
```
*Target free tier users for upsell*

**Segment: "premium" (paid users)**
```
Title: "Thank You"
Message: "New inheritance planning features added"
Segments: ["premium"]
```
*Give value to paying customers*

---

## Daily Admin Checklist

### Morning
- [ ] Check promo code usage (is LAUNCH50 close to max uses?)
- [ ] Review new users (any spam signups?)
- [ ] Check support emails for ban/promote requests

### Weekly
- [ ] Update campaign message with new feature/news
- [ ] Review conversion metrics (which campaign message worked best?)
- [ ] Check paywall messaging still relevant

### Monthly
- [ ] Review pricing (need adjustment for inflation?)
- [ ] Retire old promo codes
- [ ] Archive finished campaigns
- [ ] Check audit logs for unusual admin activity

---

## Common Admin Tasks

### Launch a New Feature
1. Update marketing messages to highlight feature
2. Create campaign targeting "all" users
3. May want to give free trial with promo code
4. Monitor campaign click-through rate

**Example - Launching Biometric Login:**
```
Marketing Messages:
├─ Title: "Unlock Biometric Login"
├─ Subtitle: "No passwords needed - use your fingerprint"
└─ FOMO: "Available now in Guardian plan"

Campaign:
├─ Title: "Biometric Security Now Live"
├─ Message: "Secure your vault with fingerprint or face recognition"
├─ CTA: "Enable Biometric Login"
└─ Target: ["all"]

Promo Code:
├─ BIOLAUNCH: 30% off for first 50 users
├─ Drive adoption while new
```

---

### Run a Limited Time Promotion
1. Create time-limited promo code
2. Update marketing message with deadline
3. Send campaign to target audience
4. Monitor code usage rate
5. Deactivate when period ends

**Example - Black Friday:**
```
Promo Code: BLACKFRI
├─ Type: 50% off monthly
├─ Max Uses: 200
├─ Expires: Nov 30, 2025

Marketing Message:
├─ FOMO: "Black Friday: 50% off all plans through Nov 30!"

Campaign:
├─ Target: ["free", "essential"]
├─ Message: "Limited time: 50% off Guardian plan this weekend only"
```

---

### Manage Support Escalations
1. User complains about feature access
2. Review their account and plan
3. Upgrade to premium or apply discount code
4. Log in audit trail
5. Respond to support email

**Steps:**
1. Find user in Users tab by email
2. Click "Promote to Premium"
3. Or create "SUPPORT" promo code with 100% discount
4. Tell user to use code at checkout

---

## Troubleshooting Admin Issues

### Can't Access Admin Panel
**Error:** "Invalid email or password"
- Verify your email is in Firebase `/users/{uid}`
- Verify you have `role: 'super_admin'` set
- Reset password in Firebase Console if needed

**Error:** "Access Denied"
- You don't have super_admin role
- Contact app owner to promote your account
- Ask them to add `role: 'super_admin'` to your user document

---

### Changes Not Showing in App
**Pricing updated but button still shows old price:**
- User must refresh app (browser reload)
- May be browser cache - hard refresh (Ctrl+Shift+R)
- Check Firestore has correct fields (case-sensitive)

**Promo code created but doesn't work:**
- Check code is UPPERCASE in Firestore
- Verify `active: true`
- Check `usedCount < maxUses`

**Campaign not showing on dashboard:**
- Verify `active: true`
- Check target segments include user's segment
- Campaign must exist in `/campaigns` collection

---

### Audit Trail

Every admin action is logged to `/audit_logs` with:
- Action performed (promote, ban, edit, create_code, etc.)
- Admin email who did it
- User affected (if applicable)
- Timestamp
- Old value → New value

**Use for:**
- Compliance tracking
- Dispute resolution
- Accountability
- Suspicious activity detection

---

## Best Practices

### Pricing
✅ DO:
- Test price changes with a small audience first
- Keep yearly price ~15% cheaper than monthly × 12
- Update currency if changing markets

❌ DON'T:
- Change prices mid-campaign (confusing to users)
- Make price too high too fast (risk losing users)
- Have multiple promo codes with overlapping discounts

### Promo Codes
✅ DO:
- Give codes meaningful names (LAUNCH50, BLACKFRI, VIP100)
- Set reasonable max uses (100-500)
- Track which codes drive most conversions
- Archive expired codes

❌ DON'T:
- Create unlimited codes (hurts revenue)
- Use vague names (CODE123, DISCOUNT1)
- Forget to deactivate after promotion ends
- Stack multiple discounts

### Marketing Messages
✅ DO:
- Change messages monthly to stay fresh
- Use A/B testing to find best messaging
- Include urgency (limited time, limited spots)
- Highlight user pain point (emergency access, family protection)

❌ DON'T:
- Use same message for 6+ months
- Use misleading urgency ("limited" but always available)
- Messages longer than 2 sentences
- Complex jargon - keep simple

### Campaigns
✅ DO:
- Send 1-2 campaigns per week (not overwhelming)
- Segment by user type (free vs premium)
- Track which campaigns get clicked most
- Archive old campaigns

❌ DON'T:
- Send too many campaigns (users ignore them)
- Same campaign to everyone regardless of plan
- Campaigns about features they don't have access to
- No clear call-to-action

---

## Support Contacts

For help with:
- **Technical issues**: Check [FIREBASE_TEST_GUIDE.md](./FIREBASE_TEST_GUIDE.md)
- **Admin access issues**: Contact system administrator
- **Feature questions**: See [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
- **Firestore setup**: See [FIREBASE_ADMIN_GUIDE.md](./FIREBASE_ADMIN_GUIDE.md)
