export type BookingStep = 1 | 2 | 3;

export interface BookingFormData {
  fullName: string;
  cellphone: string;
  email: string;
  alternativeNumber: string;
  address: string;
  date: string;
  time: string;
  specificService: string;
  customService: string;
  urgency: string;
  contactMethod: string;
  description: string;
}
