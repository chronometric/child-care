/**
 * Feature flags. Billing/payment flows are off by default so the app stays
 * focused on care + sessions until Stripe/invoicing is production-ready.
 * Set VITE_ENABLE_COMMERCIAL_FLOWS=true to expose payment routes in the auth flow.
 */
export const FEATURES = {
  commercialAuthFlows:
    import.meta.env.VITE_ENABLE_COMMERCIAL_FLOWS === "true",
} as const;
