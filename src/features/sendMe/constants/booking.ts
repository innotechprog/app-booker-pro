export const bookingStepLabels = [
  "Step 1: Personal Information",
  "Step 2: Service Information",
  "Step 3: Review & Accept",
] as const;

export const bookingSpecificServiceOptions = [
  { value: "grocery-shopping", label: "Grocery Shopping" },
  { value: "prescription-pickup", label: "Prescription Pickup" },
  { value: "package-delivery", label: "Package Delivery" },
  { value: "document-delivery", label: "Document Delivery" },
  { value: "appointment-scheduling", label: "Appointment Scheduling" },
  { value: "household-tasks", label: "Household Tasks" },
  { value: "event-assistance", label: "Event Assistance" },
  { value: "childcare-support", label: "Childcare Support" },
  { value: "trip", label: "Trip" },
  { value: "other", label: "Other" },
] as const;

export function getBookingSpecificServiceLabel(value: string): string {
  const opt = bookingSpecificServiceOptions.find((o) => o.value === value);
  return opt?.label ?? value;
}

export const bookingUrgencyOptions = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
] as const;

export const bookingContactMethodOptions = [
  { value: "phone", label: "Phone" },
  { value: "email", label: "Email" },
  { value: "whatsapp", label: "WhatsApp" },
] as const;
