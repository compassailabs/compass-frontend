/**
 * Outbound URL back to the compass-landing site (the rail brand + "Exit setup").
 * Override at deploy time so staging / production point at the right host.
 */
export const APP_LANDING_URL =
  process.env.NEXT_PUBLIC_LANDING_URL || "/";
