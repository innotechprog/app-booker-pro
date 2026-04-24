import type { BookingFormData } from "@/features/sendMe/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_DIGITS_RE = /^\d{7,15}$/;

const BOOKING_LEAD_MS = 2 * 60 * 60 * 1000;

export function getLocalDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatLocalTimeHHMM(d: Date): string {
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${min}`;
}

export function getEarliestBookingInstant(now: Date = new Date()): Date {
  return new Date(now.getTime() + BOOKING_LEAD_MS);
}

/** Earliest calendar day (local) that can hold a valid slot — respects the 2-hour lead time. */
export function getMinBookingDateString(now: Date = new Date()): string {
  return getLocalDateString(getEarliestBookingInstant(now));
}

/** `min` value for `<input type="time">` when `selectedDateStr` is `YYYY-MM-DD` (local), or `undefined` if any time is allowed that day. */
export function getMinTimeForBookingDate(selectedDateStr: string, now: Date = new Date()): string | undefined {
  if (!selectedDateStr) return undefined;
  const minDate = getMinBookingDateString(now);
  if (selectedDateStr < minDate) return undefined;
  if (selectedDateStr > minDate) return undefined;
  return formatLocalTimeHHMM(getEarliestBookingInstant(now));
}

export function parseBookingLocalDateTime(dateStr: string, timeStr: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr) || !timeStr.trim()) return null;
  const t = timeStr.trim();
  if (!/^\d{2}:\d{2}(:\d{2})?$/.test(t)) return null;
  const [hh, mm, secPart] = t.split(":");
  const ss = secPart ?? "0";
  const y = Number(dateStr.slice(0, 4));
  const mo = Number(dateStr.slice(5, 7));
  const d = Number(dateStr.slice(8, 10));
  const date = new Date(y, mo - 1, d, Number(hh), Number(mm), Number(ss), 0);
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) return null;
  return date;
}

export function validatePreferredDateTime(dateStr: string, timeStr: string, now: Date = new Date()): string | null {
  const earliest = getEarliestBookingInstant(now);
  const parsed = parseBookingLocalDateTime(dateStr, timeStr);
  if (!parsed) return "Please choose a valid date and time.";
  if (parsed.getTime() < earliest.getTime()) {
    return "Bookings must be at least 2 hours from now. Choose a later date or time.";
  }
  return null;
}

/** @returns Error message if invalid, otherwise `null`. */
export function validateBookingStep1(form: BookingFormData): string | null {
  if (!form.fullName.trim() || !form.cellphone.trim() || !form.email.trim() || !form.address.trim()) {
    return "Please complete the required fields.";
  }
  if (!EMAIL_RE.test(form.email.trim())) {
    return "Please enter a valid email address.";
  }
  if (!PHONE_DIGITS_RE.test(form.cellphone.trim())) {
    return "Please enter a valid cellphone number (digits only).";
  }
  if (form.alternativeNumber.trim() && !PHONE_DIGITS_RE.test(form.alternativeNumber.trim())) {
    return "Alternative number must contain digits only.";
  }
  return null;
}

/** @returns Error message if invalid, otherwise `null`. */
export function validateBookingStep2(form: BookingFormData): string | null {
  if (!form.date || !form.time || !form.specificService) {
    return "Please complete service information.";
  }
  if (form.specificService === "other" && !form.customService.trim()) {
    return "Please specify the service you need.";
  }
  if (form.specificService === "trip" && (!form.tripPickup.trim() || !form.tripDropoff.trim())) {
    return "Please enter pick up and drop off for your trip.";
  }
  const dateTimeMsg = validatePreferredDateTime(form.date, form.time);
  if (dateTimeMsg) return dateTimeMsg;
  return null;
}
