
import { APP_CONFIG } from '../constants/appConfig';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  highlightColor: 'blue' | 'gold' | 'emerald' | 'crimson';
  features: string[];
  recommended?: boolean;
  ctaText?: string;
}

/**
 * HATI PRODUCT ROADMAP
 * Modify this array to update the pricing table dynamically.
 */
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'essential',
    name: 'Essential Plan',
    price: 0,
    currency: APP_CONFIG.DEFAULT_CURRENCY,
    highlightColor: 'blue',
    features: [
      "Basic Vault Storage",
      "Standard AI Extraction",
      "Single Registry Profile",
      "Email Support"
    ],
    ctaText: "Current Plan"
  },
  {
    id: 'guardian',
    name: 'Guardian Plan',
    price: 299,
    currency: APP_CONFIG.DEFAULT_CURRENCY,
    highlightColor: 'gold',
    recommended: true,
    features: [
      "Unlimited Scribe AI",
      "Biometric Hardware Lock",
      "Family Profile Registry",
      "Interaction Risk Detection",
      "Certified PDF Reports",
      "24/7 WhatsApp Concierge"
    ],
    ctaText: "Upgrade to Guardian"
  }
];
