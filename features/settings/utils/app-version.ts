import type { AppUpdateStatus } from "../api";

/**
 * Same rules as the API (server/src/app-versions/shared/utils/compare-versions.ts):
 * `major[.minor[.patch]]` with an ignored `+build` suffix.
 */
export const APP_VERSION_PATTERN =
  /^\d{1,6}(\.\d{1,6}){0,2}(\+[0-9A-Za-z.-]{1,32})?$/;

export function isValidAppVersion(version: string): boolean {
  return APP_VERSION_PATTERN.test(version);
}

/** Negative if `a < b`, 0 if equal, positive if `a > b`; NaN if invalid. */
export function compareVersions(a: string, b: string): number {
  if (!isValidAppVersion(a) || !isValidAppVersion(b)) return NaN;
  const parts = (v: string) => {
    const [major, minor = 0, patch = 0] = v.split("+")[0].split(".").map(Number);
    return [major, minor, patch];
  };
  const pa = parts(a);
  const pb = parts(b);
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pa[i] - pb[i];
  }
  return 0;
}

/** Status the API would give `version` under this policy. */
export function resolveUpdateStatus(
  policy: {
    latestVersion: string;
    minSupportedVersion: string;
    blockedVersions: string[];
  },
  version: string,
): AppUpdateStatus | null {
  if (!isValidAppVersion(version)) return null;
  if (
    compareVersions(version, policy.minSupportedVersion) < 0 ||
    policy.blockedVersions.some((v) => compareVersions(v, version) === 0)
  ) {
    return "required";
  }
  if (compareVersions(version, policy.latestVersion) < 0) return "optional";
  return "up_to_date";
}
