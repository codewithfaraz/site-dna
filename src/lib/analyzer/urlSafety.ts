import { lookup } from "node:dns/promises";
import net from "node:net";

const BLOCKED_PROTOCOLS = new Set([
  "file:",
  "ftp:",
  "chrome:",
  "chrome-extension:",
  "data:",
  "javascript:",
]);

const IPV6_LOOPBACK = new Set(["::1", "0:0:0:0:0:0:0:1"]);

export type SafeUrlResult = {
  inputUrl: string;
  normalizedUrl: string;
  domain: string;
};

export class UrlSafetyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UrlSafetyError";
  }
}

export async function validateAndNormalizePublicUrl(
  inputUrl: string,
): Promise<SafeUrlResult> {
  const withProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(inputUrl)
    ? inputUrl
    : `https://${inputUrl}`;

  let url: URL;
  try {
    url = new URL(withProtocol);
  } catch {
    throw new UrlSafetyError("Enter a valid public website URL.");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new UrlSafetyError("Only http and https URLs are allowed.");
  }

  if (BLOCKED_PROTOCOLS.has(url.protocol)) {
    throw new UrlSafetyError("That URL protocol is not allowed.");
  }

  if (!url.hostname) {
    throw new UrlSafetyError("The website URL is missing a hostname.");
  }

  const hostname = url.hostname.toLowerCase();
  if (isBlockedHostname(hostname)) {
    throw new UrlSafetyError("Local, private, and internal network URLs are blocked.");
  }

  if (net.isIP(hostname) && isPrivateIp(hostname)) {
    throw new UrlSafetyError("Private or loopback IP addresses are not allowed.");
  }

  try {
    const resolved = await lookup(hostname, { all: true, verbatim: true });
    if (resolved.some((entry) => isPrivateIp(entry.address))) {
      throw new UrlSafetyError(
        "The domain resolves to a private or internal network address.",
      );
    }
  } catch (error) {
    if (error instanceof UrlSafetyError) {
      throw error;
    }
  }

  url.hash = "";
  if ((url.protocol === "https:" && url.port === "443") || (url.protocol === "http:" && url.port === "80")) {
    url.port = "";
  }

  if (!url.pathname) {
    url.pathname = "/";
  }

  return {
    inputUrl,
    normalizedUrl: url.toString(),
    domain: hostname,
  };
}

function isBlockedHostname(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname === "0.0.0.0" ||
    IPV6_LOOPBACK.has(hostname)
  );
}

function isPrivateIp(ip: string): boolean {
  if (net.isIPv6(ip)) {
    return IPV6_LOOPBACK.has(ip.toLowerCase()) || ip.toLowerCase().startsWith("fe80:");
  }

  const parts = ip.split(".").map((part) => Number.parseInt(part, 10));
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
    return false;
  }

  const [first, second] = parts;
  if (first === 10 || first === 127) {
    return true;
  }
  if (first === 169 && second === 254) {
    return true;
  }
  if (first === 192 && second === 168) {
    return true;
  }
  if (first === 172 && second >= 16 && second <= 31) {
    return true;
  }
  return false;
}
