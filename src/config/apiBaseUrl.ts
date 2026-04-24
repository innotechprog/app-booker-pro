/**
 * Resolved API base URL (no trailing slash).
 * Keep in sync with any change to how `src/services/api.ts` chooses the backend.
 */
export function getResolvedApiBaseUrl(): string {
  const raw =
    import.meta.env.DEV && !import.meta.env.VITE_API_URL
      ? "/api"
      : import.meta.env.VITE_API_URL || "https://ib-backend.ib-innovativesolutions.com/api/";
  return raw.replace(/\/+$/, "");
}
