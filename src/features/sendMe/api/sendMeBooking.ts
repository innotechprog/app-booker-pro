import { getResolvedApiBaseUrl } from "@/config/apiBaseUrl";

export function getSendMeBookingApiBase(): string {
  const fromEnv = import.meta.env.VITE_SENDME_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "");

  // Dev: POST /sendme/booking is expected on local ib-backend (same as Job Assist). Production uses live API below.
  if (import.meta.env.DEV) {
    const local = import.meta.env.VITE_LOCAL_API_URL?.trim();
    if (local) return local.replace(/\/+$/, "");
    return "http://localhost:5000/api";
  }

  return getResolvedApiBaseUrl();
}

/** Resolves to `.../api` (no trailing slash). Used to build Send Me and contact URLs consistently. */
function getBookingApiRoot(): string {
  const base = getSendMeBookingApiBase().replace(/\/+$/, "");
  if (base.endsWith("/sendme")) {
    const root = base.slice(0, -"/sendme".length).replace(/\/+$/, "");
    return root.endsWith("/api") ? root : `${root}/api`;
  }
  return base.endsWith("/api") ? base : `${base}/api`;
}

function getSendMeBookingPostUrl(): string {
  return `${getBookingApiRoot()}/sendme/booking`;
}

function getSendMeLegacyContactBookingUrl(): string {
  return `${getBookingApiRoot()}/contact/send-send-me-booking`;
}

function getContactSendUrl(): string {
  return `${getBookingApiRoot()}/contact/send-contact`;
}

export interface SendMeBookingRequestBody {
  fullName: string;
  email: string;
  cellphone: string;
  alternativeNumber: string | null;
  address: string;
  bookingType: string;
  specificService: string;
  preferredDate: string;
  preferredTime: string;
  urgency: string;
  preferredContact: string;
  acceptedTerms: boolean;
  additionalDetails: string | null;
  /** Present for Trip bookings. If your API rejects unknown JSON keys, omit these and rely on `additionalDetails` only. */
  tripPickup?: string;
  tripDropoff?: string;
  tripStops?: string[];
}

export function formatTripBookingDetails(pickup: string, dropoff: string, stops: string[]): string {
  const lines = ["[Trip routing]", `Pick up: ${pickup.trim()}`, `Drop off: ${dropoff.trim()}`];
  const nonempty = stops.map((s) => s.trim()).filter(Boolean);
  nonempty.forEach((s, i) => {
    lines.push(`Stop ${i + 1}: ${s}`);
  });
  return lines.join("\n");
}

type BookingResponseJson = {
  error?: string;
  message?: string;
  emailSent?: boolean;
  emailNote?: string;
  details?: string;
};

function errorDetail(data: BookingResponseJson): string {
  return (
    (typeof data.error === "string" && data.error) ||
    (typeof data.message === "string" && data.message) ||
    (typeof data.details === "string" && data.details) ||
    ""
  );
}

async function postBookingJson(url: string, body: SendMeBookingRequestBody): Promise<Response> {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/** When dedicated Send Me routes are not deployed, relay via existing POST /api/contact/send-contact. */
async function postSendMeAsContactMessage(body: SendMeBookingRequestBody): Promise<Response> {
  const parts = body.fullName.trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0] ?? "Customer";
  const lastName = parts.length > 1 ? parts.slice(1).join(" ") : "-";
  const tripSummaryLines: string[] =
    body.tripPickup?.trim() && body.tripDropoff?.trim()
      ? ["", ...formatTripBookingDetails(body.tripPickup, body.tripDropoff, body.tripStops ?? []).split("\n")]
      : [];

  const message = [
    "Send Me — service booking request",
    "",
    `Service: ${body.specificService}`,
    `Booking type: ${body.bookingType}`,
    `Preferred date: ${body.preferredDate}`,
    `Preferred time: ${body.preferredTime}`,
    `Urgency: ${body.urgency}`,
    `Preferred contact: ${body.preferredContact}`,
    `Address: ${body.address}`,
    body.alternativeNumber ? `Alternative number: ${body.alternativeNumber}` : null,
    ...tripSummaryLines,
    `Terms accepted: ${body.acceptedTerms ? "Yes" : "No"}`,
    body.additionalDetails ? `Additional details: ${body.additionalDetails}` : null,
  ]
    .filter((line): line is string => line != null && line !== "")
    .join("\n");

  return fetch(getContactSendUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firstName,
      lastName,
      email: body.email,
      phone: body.cellphone,
      service: body.specificService,
      message,
    }),
  });
}

function assertBookingSuccess(res: Response, data: BookingResponseJson): void {
  if (!res.ok) {
    throw new Error(errorDetail(data) || "Failed to send booking email.");
  }
  if (data.emailSent === false) {
    throw new Error(
      typeof data.emailNote === "string" && data.emailNote
        ? data.emailNote
        : "Booking was received but the notification email could not be sent.",
    );
  }
}

export async function submitSendMeBooking(body: SendMeBookingRequestBody): Promise<void> {
  const primaryUrl = getSendMeBookingPostUrl();
  let res = await postBookingJson(primaryUrl, body);
  let data = (await res.json().catch(() => ({}))) as BookingResponseJson;

  if (res.status === 404) {
    const legacyUrl = getSendMeLegacyContactBookingUrl();
    res = await postBookingJson(legacyUrl, body);
    data = (await res.json().catch(() => ({}))) as BookingResponseJson;
  }

  if (res.status === 404) {
    res = await postSendMeAsContactMessage(body);
    data = (await res.json().catch(() => ({}))) as BookingResponseJson;
  }

  assertBookingSuccess(res, data);
}
