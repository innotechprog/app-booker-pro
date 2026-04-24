/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  /** Local ib-backend base for routes not on production (Job Assist, etc.). Send Me dev booking uses this when set. */
  readonly VITE_LOCAL_API_URL?: string;
  /** Override Send Me booking API base; otherwise production uses `VITE_API_URL`. */
  readonly VITE_SENDME_API_URL?: string;
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;
  /** Send Me staff admin (`/sendme/admin`). Required in production builds; in dev defaults to `sendme` if unset. */
  readonly VITE_SENDME_ADMIN_PASSWORD?: string;
}
