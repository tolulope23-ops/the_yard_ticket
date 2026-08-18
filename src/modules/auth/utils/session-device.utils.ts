export function deriveDeviceName(
  userAgent?: string,
): string | undefined {
  // No user-agent provided, cannot infer device
  if (!userAgent) return undefined;

  const ua = userAgent.toLowerCase();

  /**
   * Basic user-agent fingerprinting.
   * Used for lightweight session/device labeling (not security-critical).
   */
  if (ua.includes('iphone')) return 'iPhone';
  if (ua.includes('ipad')) return 'iPad';
  if (ua.includes('android')) return 'Android Device';
  if (ua.includes('windows')) return 'Windows Device';
  if (ua.includes('mac os') || ua.includes('macintosh')) return 'Mac Device';
  if (ua.includes('linux')) return 'Linux Device';

  // Fallback for unrecognized user agents
  return 'Unknown Device';
};

export function extractIpAddress(request: {
  ip?: string;
  headers?: { [key: string]: unknown };
}): string | undefined {
  /**
   * Extract real client IP address from request.
   *
   * Priority order:
   * 1. x-forwarded-for (behind proxies / load balancers)
   * 2. request.ip (direct connection fallback)
   */

  const forwardedFor = request.headers?.['x-forwarded-for'];

  // Handle proxy chains (comma-separated IPs)
  if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
    return forwardedFor.split(',')[0].trim();
  };

  // Handle unexpected array-based header formats
  if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
    return String(forwardedFor[0]).trim();
  };

  // Fallback to direct request IP
  return request.ip ?? undefined;
};