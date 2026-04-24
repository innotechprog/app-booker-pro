const SESSION_KEY = "sendme_admin_session";

export function getSendMeAdminPassword(): string | undefined {
  const v = import.meta.env.VITE_SENDME_ADMIN_PASSWORD;
  if (typeof v === "string" && v.length > 0) return v;
  if (import.meta.env.DEV) return "sendme";
  return undefined;
}

export function isSendMeAdminAuthed(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === "1";
}

export function sendMeAdminLogin(password: string): boolean {
  const expected = getSendMeAdminPassword();
  if (!expected) return false;
  if (password !== expected) return false;
  sessionStorage.setItem(SESSION_KEY, "1");
  return true;
}

export function sendMeAdminLogout(): void {
  sessionStorage.removeItem(SESSION_KEY);
}
