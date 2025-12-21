
/**
 * HATI GLOBAL CONFIGURATION
 * Managed by the Business Owner Authority.
 * Changes here propagate throughout the entire registry lifecycle.
 */
export const APP_CONFIG = {
  // Support & Concierge
  SUPPORT_WHATSAPP: "254700000000",
  SUPPORT_EMAIL: "concierge@hati-registry.com",
  
  // Security Protocols
  AUTO_LOCK_TIMEOUT_MS: 900000, // 15 minutes: Duration of inactivity before vault lockdown
  
  // Financial & Localization
  DEFAULT_CURRENCY: "KES",
  DEFAULT_CURRENCY_SYMBOL: "Ksh",
  
  // System Endpoints
  API_BASE_URL: typeof window !== 'undefined' ? window.location.origin : '',
};
